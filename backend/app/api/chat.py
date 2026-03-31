"""Chat API with Agent."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ChatMessage, ChatResponse
from ..agent import Agent

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(message: ChatMessage, db: Session = Depends(get_db)):
    """Chat with Agent."""
    agent = Agent(db)
    result = agent.chat(message.message)
    return ChatResponse(
        response=result["response"],
        tool_calls=result.get("tool_calls")
    )
