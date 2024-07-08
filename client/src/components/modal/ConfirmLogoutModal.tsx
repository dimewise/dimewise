import { forwardRef } from "react";
import { useAuth } from "../../hooks/useAuth";

interface Props {
	handleClose: () => void;
}

export const ConfirmLogoutModal = forwardRef<HTMLDialogElement, Props>(({ handleClose }, ref) => {
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
	};

	return (
		<dialog
			className="modal modal-bottom lg:modal-middle"
			ref={ref}
		>
			<div className="modal-box">
				<h3 className="font-bold text-lg">Logout</h3>
				<p className="py-4">
					Are you sure you want to logout from Dimewise? Doing so will require you to log back in the next time you
					visit.
				</p>
				<div className="modal-action">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button
							type="button"
							className="btn"
							onClick={handleClose}
						>
							Close
						</button>
						<button
							type="button"
							className="btn btn-error text-white"
							onClick={handleLogout}
						>
							Logout
						</button>
					</form>
				</div>
			</div>
			<form
				method="dialog"
				className="modal-backdrop"
			>
				{/* if there is a button in form, it will close the modal */}
				<button
					type="button"
					onClick={handleClose}
				>
					Close
				</button>
			</form>
		</dialog>
	);
});
