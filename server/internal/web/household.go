package web

import (
	"context"
	"errors"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// CreateHousehold handles POST /households
func (h *Handler) CreateHousehold(
	ctx context.Context,
	request oapi.CreateHouseholdRequestObject,
) (oapi.CreateHouseholdResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.CreateHousehold401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	household, _, err := h.householdService.Create(
		ctx,
		user.ID,
		request.Body.Name,
		string(request.Body.Currency),
	)
	if err != nil {
		return mapHouseholdCreateError(err)
	}

	return oapi.CreateHousehold201JSONResponse(householdToAPI(household)), nil
}

// GetMyHousehold handles GET /households/me
func (h *Handler) GetMyHousehold(
	ctx context.Context,
	_ oapi.GetMyHouseholdRequestObject,
) (oapi.GetMyHouseholdResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetMyHousehold401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	household, members, err := h.householdService.GetByUser(ctx, user.ID)
	if err != nil {
		return mapHouseholdGetError(err)
	}

	return oapi.GetMyHousehold200JSONResponse(householdWithMembersToAPI(household, members)), nil
}

// JoinHousehold handles POST /households/join
func (h *Handler) JoinHousehold(
	ctx context.Context,
	request oapi.JoinHouseholdRequestObject,
) (oapi.JoinHouseholdResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.JoinHousehold401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	household, members, err := h.householdService.Join(ctx, user.ID, request.Body.InviteCode)
	if err != nil {
		return mapHouseholdJoinError(err)
	}

	return oapi.JoinHousehold200JSONResponse(householdWithMembersToAPI(household, members)), nil
}

// LeaveHousehold handles POST /households/leave
func (h *Handler) LeaveHousehold(
	ctx context.Context,
	_ oapi.LeaveHouseholdRequestObject,
) (oapi.LeaveHouseholdResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.LeaveHousehold401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	err := h.householdService.Leave(ctx, user.ID)
	if err != nil {
		return mapHouseholdLeaveError(err)
	}

	return oapi.LeaveHousehold204Response{}, nil
}

// RegenerateInviteCode handles POST /households/invite-code/regenerate
func (h *Handler) RegenerateInviteCode(
	ctx context.Context,
	_ oapi.RegenerateInviteCodeRequestObject,
) (oapi.RegenerateInviteCodeResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.RegenerateInviteCode401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	household, err := h.householdService.RegenerateInviteCode(ctx, user.ID)
	if err != nil {
		return mapHouseholdRegenerateError(err)
	}

	return oapi.RegenerateInviteCode200JSONResponse(householdToAPI(household)), nil
}

// RemoveHouseholdMember handles DELETE /households/members/{userId}
func (h *Handler) RemoveHouseholdMember(
	ctx context.Context,
	request oapi.RemoveHouseholdMemberRequestObject,
) (oapi.RemoveHouseholdMemberResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.RemoveHouseholdMember401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	targetID, err := uuid.Parse(request.UserId.String())
	if err != nil {
		return oapi.RemoveHouseholdMember400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", "invalid user ID"),
			),
		}, nil
	}

	err = h.householdService.RemoveMember(ctx, user.ID, targetID)
	if err != nil {
		return mapHouseholdRemoveMemberError(err)
	}

	return oapi.RemoveHouseholdMember204Response{}, nil
}

// DeleteHousehold handles DELETE /households
func (h *Handler) DeleteHousehold(
	ctx context.Context,
	_ oapi.DeleteHouseholdRequestObject,
) (oapi.DeleteHouseholdResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.DeleteHousehold401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	err := h.householdService.Delete(ctx, user.ID)
	if err != nil {
		return mapHouseholdDeleteError(err)
	}

	return oapi.DeleteHousehold204Response{}, nil
}

// --- API type mappers ---

func householdToAPI(h *model.Households) oapi.Household {
	return oapi.Household{
		Id:         h.ID,
		Name:       h.Name,
		Currency:   h.Currency,
		InviteCode: h.InviteCode,
		OwnerId:    h.OwnerID,
		CreatedAt:  h.CreatedAt,
		UpdatedAt:  h.UpdatedAt,
	}
}

func householdWithMembersToAPI(
	h *model.Households,
	members []repository.HouseholdMemberWithUser,
) oapi.HouseholdWithMembers {
	apiMembers := make([]oapi.HouseholdMember, 0, len(members))
	for _, m := range members {
		apiMembers = append(apiMembers, oapi.HouseholdMember{
			Id:        m.ID,
			UserId:    m.UserID,
			Email:     openapi_types.Email(m.User.Email),
			FirstName: m.User.FirstName,
			LastName:  m.User.LastName,
			AvatarUrl: m.User.AvatarURL,
			JoinedAt:  m.JoinedAt,
		})
	}

	return oapi.HouseholdWithMembers{
		Id:         h.ID,
		Name:       h.Name,
		Currency:   h.Currency,
		InviteCode: h.InviteCode,
		OwnerId:    h.OwnerID,
		CreatedAt:  h.CreatedAt,
		UpdatedAt:  h.UpdatedAt,
		Members:    apiMembers,
	}
}

// --- Error mappers ---

func mapHouseholdCreateError(err error) (oapi.CreateHouseholdResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.CreateHousehold400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrConflict:
		return oapi.CreateHousehold409ApplicationProblemPlusJSONResponse{
			ConflictApplicationProblemPlusJSONResponse: oapi.ConflictApplicationProblemPlusJSONResponse(
				newProblem(409, "Conflict", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapHouseholdGetError(err error) (oapi.GetMyHouseholdResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	if svcErr.Code == service.ErrNotFound {
		return oapi.GetMyHousehold404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	}

	return nil, err
}

func mapHouseholdJoinError(err error) (oapi.JoinHouseholdResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.JoinHousehold404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrConflict:
		return oapi.JoinHousehold409ApplicationProblemPlusJSONResponse{
			ConflictApplicationProblemPlusJSONResponse: oapi.ConflictApplicationProblemPlusJSONResponse(
				newProblem(409, "Conflict", svcErr.Message),
			),
		}, nil
	case service.ErrBadRequest:
		return oapi.JoinHousehold400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapHouseholdLeaveError(err error) (oapi.LeaveHouseholdResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.LeaveHousehold404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.LeaveHousehold403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapHouseholdRegenerateError(err error) (oapi.RegenerateInviteCodeResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.RegenerateInviteCode404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.RegenerateInviteCode403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapHouseholdRemoveMemberError(err error) (oapi.RemoveHouseholdMemberResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.RemoveHouseholdMember400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.RemoveHouseholdMember403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.RemoveHouseholdMember404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapHouseholdDeleteError(err error) (oapi.DeleteHouseholdResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.DeleteHousehold404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.DeleteHousehold403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
