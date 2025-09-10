package dto

import (
	"encoding/base64"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// CursorData represents the data encoded in a cursor.
type CursorData struct {
	ID        uuid.UUID `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	// Future: could add sort order, filters, etc.
}

// EncodeCursor encodes cursor data into a base64 string.
func EncodeCursor(data CursorData) (string, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(jsonData), nil
}

// DecodeCursor decodes a base64 string back to cursor data.
func DecodeCursor(cursor string) (*CursorData, error) {
	jsonData, err := base64.URLEncoding.DecodeString(cursor)
	if err != nil {
		return nil, err
	}

	var data CursorData
	err = json.Unmarshal(jsonData, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

// CreateCursorFromExpense creates a cursor from an expense record.
func CreateCursorFromExpense(id uuid.UUID, timestamp time.Time) (string, error) {
	return EncodeCursor(CursorData{
		ID:        id,
		Timestamp: timestamp,
	})
}
