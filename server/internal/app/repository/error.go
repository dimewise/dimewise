package repository

type ErrorCode string

const (
	ErrCodeNotFound ErrorCode = "NOT_FOUND"
)

type Error struct {
	Code ErrorCode
	Err  error // original error
}

func NewError(code ErrorCode, err error) *Error {
	return &Error{
		Code: code,
		Err:  err,
	}
}

func (e *Error) Error() string {
	return e.Err.Error()
}
