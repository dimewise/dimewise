package web

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"
)

// ListSettlements handles GET /settlements
func (h *Handler) ListSettlements(
	ctx context.Context,
	_ oapi.ListSettlementsRequestObject,
) (oapi.ListSettlementsResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ListSettlements401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	settlements, err := h.settlementService.List(ctx, user.ID)
	if err != nil {
		return mapSettlementListError(err)
	}

	result := make(oapi.ListSettlements200JSONResponse, 0, len(settlements))
	for i := range settlements {
		result = append(result, settlementToAPI(&settlements[i]))
	}

	return result, nil
}

// GenerateSettlement handles POST /settlements/generate
func (h *Handler) GenerateSettlement(
	ctx context.Context,
	request oapi.GenerateSettlementRequestObject,
) (oapi.GenerateSettlementResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GenerateSettlement401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	created, err := h.settlementService.Generate(
		ctx,
		user.ID,
		request.Body.Month,
		request.Body.Year,
	)
	if err != nil {
		return mapSettlementGenerateError(err)
	}

	return oapi.GenerateSettlement201JSONResponse(settlementWithTransfersToAPI(created)), nil
}

// GetSettlement handles GET /settlements/{settlementId}
func (h *Handler) GetSettlement(
	ctx context.Context,
	request oapi.GetSettlementRequestObject,
) (oapi.GetSettlementResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetSettlement401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	settlementID, err := uuid.Parse(request.SettlementId.String())
	if err != nil {
		return oapi.GetSettlement404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", "invalid settlement ID"),
			),
		}, nil
	}

	settlement, err := h.settlementService.GetByID(ctx, user.ID, settlementID)
	if err != nil {
		return mapSettlementGetError(err)
	}

	return oapi.GetSettlement200JSONResponse(settlementWithTransfersToAPI(settlement)), nil
}

// MarkTransferPaid handles PATCH /settlements/transfers/{transferId}/pay
func (h *Handler) MarkTransferPaid(
	ctx context.Context,
	request oapi.MarkTransferPaidRequestObject,
) (oapi.MarkTransferPaidResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.MarkTransferPaid401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	transferID, err := uuid.Parse(request.TransferId.String())
	if err != nil {
		return oapi.MarkTransferPaid404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", "invalid transfer ID"),
			),
		}, nil
	}

	transfer, err := h.settlementService.MarkTransferPaid(ctx, user.ID, transferID)
	if err != nil {
		return mapTransferPaidError(err)
	}

	return oapi.MarkTransferPaid200JSONResponse(settlementTransferToAPI(transfer)), nil
}

// --- Type mappers ---

func settlementToAPI(s *model.Settlements) oapi.Settlement {
	return oapi.Settlement{
		Id:          s.ID,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
		HouseholdId: s.HouseholdID,
		Month:       int(s.Month),
		Year:        int(s.Year),
		GeneratedAt: s.GeneratedAt,
	}
}

func settlementTransferToAPI(t *model.SettlementTransfers) oapi.SettlementTransfer {
	return oapi.SettlementTransfer{
		Id:           t.ID,
		CreatedAt:    t.CreatedAt,
		UpdatedAt:    t.UpdatedAt,
		SettlementId: t.SettlementID,
		FromUserId:   t.FromUserID,
		ToUserId:     t.ToUserID,
		Amount:       t.Amount,
		PaidAt:       t.PaidAt,
	}
}

func settlementWithTransfersToAPI(
	s *repository.SettlementWithTransfers,
) oapi.SettlementWithTransfers {
	transfers := make([]oapi.SettlementTransfer, 0, len(s.Transfers))
	for i := range s.Transfers {
		transfers = append(transfers, settlementTransferToAPI(&s.Transfers[i]))
	}

	return oapi.SettlementWithTransfers{
		Id:          s.ID,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
		HouseholdId: s.HouseholdID,
		Month:       int(s.Month),
		Year:        int(s.Year),
		GeneratedAt: s.GeneratedAt,
		Transfers:   transfers,
	}
}

// --- Error mappers ---

func mapSettlementListError(
	err error,
) (oapi.ListSettlementsResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.ListSettlements404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapSettlementGenerateError(
	err error,
) (oapi.GenerateSettlementResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.GenerateSettlement400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GenerateSettlement404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrConflict:
		return oapi.GenerateSettlement409ApplicationProblemPlusJSONResponse{
			ConflictApplicationProblemPlusJSONResponse: oapi.ConflictApplicationProblemPlusJSONResponse(
				newProblem(409, "Conflict", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapSettlementGetError(
	err error,
) (oapi.GetSettlementResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.GetSettlement404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GetSettlement404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapTransferPaidError(
	err error,
) (oapi.MarkTransferPaidResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.MarkTransferPaid403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.MarkTransferPaid404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrConflict:
		// Use 403 for "already paid" since there's no 409 response for this endpoint
		return oapi.MarkTransferPaid403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
