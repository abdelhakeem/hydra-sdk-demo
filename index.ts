import {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { FanoutClient, MembershipModel } from "@glasseaters/hydra-sdk";
import { NodeWallet } from "@metaplex/js";

(async () => {
  const authorityWallet = Keypair.generate();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const signature = await connection.requestAirdrop(
    authorityWallet.publicKey,
    2 * LAMPORTS_PER_SOL
  );

  connection.confirmTransaction({
    ...(await connection.getLatestBlockhash()),
    signature,
  });

  const fanoutClient = new FanoutClient(
    connection,
    new NodeWallet(authorityWallet)
  );

  const { fanout, nativeAccount } = await fanoutClient.initializeFanout({
    totalShares: 100,
    name: `TEST@${Date.now()}`,
    membershipModel: MembershipModel.Wallet,
  });

  await fanoutClient.addMemberWallet({
    fanout: fanout,
    fanoutNativeAccount: nativeAccount,
    membershipKey: Keypair.generate().publicKey,
    shares: 10,
  });
})()
  .then(() => console.log("DONE"))
  .catch((error) => console.error(error));
