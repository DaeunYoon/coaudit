"use client";

export default function CreateBugModal({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: string;
}) {
  return (
    <dialog id="create-bug-modal" className="modal text-white">
      <div className="modal-box">
        <div className="flex justify-between">
          <h3 className="font-bold text-lg">Create a bug report</h3>
          <button className="btn">x</button>
        </div>

        <p className="py-4">Bug modal</p>
        <div className="modal-action">
          <form method="dialog"></form>
        </div>
      </div>
    </dialog>
  );
}
