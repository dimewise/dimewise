package service

type ErrorCode string

const (
	ErrCodeBadRequest   ErrorCode = "BAD_REQUEST"
	ErrCodeUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrCodeForbidden    ErrorCode = "FORBIDDEN"
	ErrCodeNotFound     ErrorCode = "NOT_FOUND"
)

type Error struct {
	Code    ErrorCode
	Message string
	Err     error // original error
}

func NewError(code ErrorCode, message string, err error) *Error {
	return &Error{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

func (e *Error) Error() string {
	return e.Message
}
