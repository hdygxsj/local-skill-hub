"""Agent core - handles conversation and tool calling."""
import json
from typing import List, Dict, Any, Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from .prompts import SYSTEM_PROMPT
from .tools import AgentTools
from ..models import Config


class Agent:
    """Main agent class that handles conversation."""

    def __init__(self, db: Session):
        self.db = db
        self.tools = AgentTools(db)
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize OpenAI client with configured API key."""
        api_key_config = self.db.query(Config).filter(Config.key == "api_key").first()
        api_base_config = self.db.query(Config).filter(Config.key == "api_base_url").first()
        
        api_key = api_key_config.value if api_key_config else None
        api_base = api_base_config.value if api_base_config else None
        
        if api_key:
            kwargs = {"api_key": api_key}
            if api_base:
                kwargs["base_url"] = api_base
            self.client = OpenAI(**kwargs)

    def chat(self, message: str, history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Process a chat message and return response."""
        if not self.client:
            return {
                "response": "请先在设置页面配置 API Key。",
                "tool_calls": None
            }

        # Build messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        if history:
            messages.extend(history)
        
        messages.append({"role": "user", "content": message})

        try:
            # Call LLM with tools
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Can be configured
                messages=messages,
                tools=self.tools.get_tools_schema(),
                tool_choice="auto"
            )

            assistant_message = response.choices[0].message
            tool_calls_results = []

            # Handle tool calls
            if assistant_message.tool_calls:
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    # Execute tool
                    result = self.tools.call_tool(function_name, arguments)
                    tool_calls_results.append({
                        "tool": function_name,
                        "arguments": arguments,
                        "result": result
                    })

                # If there were tool calls, make another call to get final response
                messages.append({"role": "assistant", "content": None, "tool_calls": [
                    {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                    for tc in assistant_message.tool_calls
                ]})
                
                for i, tool_call in enumerate(assistant_message.tool_calls):
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(tool_calls_results[i]["result"], ensure_ascii=False)
                    })

                # Get final response
                final_response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages
                )
                final_text = final_response.choices[0].message.content
            else:
                final_text = assistant_message.content

            return {
                "response": final_text,
                "tool_calls": tool_calls_results if tool_calls_results else None
            }

        except Exception as e:
            return {
                "response": f"抱歉，发生了错误: {str(e)}",
                "tool_calls": None
            }
