"use client";

import Button from "../atoms/button";

export default function CreateBugModal({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: string;
}) {
  return (
    <dialog id="create-bug-modal" className="modal">
      <div className="modal-box text-white">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            // disabled={isCreatingBounty}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Create a bug report</h3>

        <div className="flex flex-col gap-4">
          {/* <Input
            type="number"
            min={0}
            placeholder="Enter reward amount"
            onChange={(e) => setBountyAmount(e.target.value)}
          /> */}

          {/* <Button
            className="btn"
            onClick={() => onCreate()}
            loading={isCreatingBounty}
          >
            Create a bounty
          </Button> */}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
        {/* <button disabled={isCreatingBounty}>close</button> */}
      </form>
    </dialog>
  );
}
