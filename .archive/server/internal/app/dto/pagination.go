package dto

import "github.com/dimewise/dimewise/generated/oapi"

// CursorPagination represents pagination information for cursor-based pagination.
type CursorPagination struct {
	Limit      int     `json:"limit"`
	HasNext    bool    `json:"has_next"`
	HasPrev    bool    `json:"has_prev"`
	NextCursor *string `json:"next_cursor,omitempty"`
	PrevCursor *string `json:"prev_cursor,omitempty"`
}

// CursorPaginatedResponse represents a paginated response with cursor pagination.
type CursorPaginatedResponse[T any] struct {
	Data       []T              `json:"data"`
	Pagination CursorPagination `json:"pagination"`
}

// TransformCursorPaginationToOAPI converts DTO cursor pagination to OpenAPI type.
func TransformCursorPaginationToOAPI(pagination CursorPagination) oapi.Pagination {
	return oapi.Pagination{
		HasNext:    pagination.HasNext,
		HasPrev:    pagination.HasPrev,
		Limit:      pagination.Limit,
		NextCursor: pagination.NextCursor,
		PrevCursor: pagination.PrevCursor,
	}
}
