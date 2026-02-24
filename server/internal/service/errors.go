package service

import "fmt"

// ErrorCode represents a domain error category.
type ErrorCode int

const (
	ErrBadRequest   ErrorCode = 400
	ErrUnauthorized ErrorCode = 401
	ErrForbidden    ErrorCode = 403
	ErrNotFound     ErrorCode = 404
	ErrConflict     ErrorCode = 409
	ErrInternal     ErrorCode = 500
)

// Error is a domain-level error with a code and message.
type Error struct {
	Code    ErrorCode
	Message string
	Err     error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}

	return e.Message
}

func (e *Error) Unwrap() error {
	return e.Err
}

func NewError(code ErrorCode, message string) *Error {
	return &Error{Code: code, Message: message}
}

func WrapError(code ErrorCode, message string, err error) *Error {
	return &Error{Code: code, Message: message, Err: err}
}
