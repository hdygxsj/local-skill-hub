package cursor

func NewAdapter() *Adapter {
	return &Adapter{}
}

func NewCursorAdapter() *Adapter {
	return NewAdapter()
}
