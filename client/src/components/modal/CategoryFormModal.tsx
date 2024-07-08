import { forwardRef } from "react";

interface Props {
	handleClose: () => void;
	selectedCategoryId: string | null;
	setSelectedCategoryId: (id: string | null) => void;
}

export const CategoryFormModal = forwardRef<HTMLDialogElement, Props>(
	({ handleClose, selectedCategoryId, setSelectedCategoryId }, ref) => {
		const title = selectedCategoryId ? "Edit Category" : "Create Category";

		const handleCloseModal = () => {
			if (selectedCategoryId) {
				setSelectedCategoryId(null);
			}
			handleClose();
		};

		return (
			<dialog
				className="modal modal-bottom lg:modal-middle"
				ref={ref}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">{title}</h3>
					<p className="py-4">Press ESC key or click the button below to close</p>
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
								onClick={() => { }}
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
						onClick={handleCloseModal}
					>
						Close
					</button>
				</form>
			</dialog>
		);
	},
);
