import appPromise from "../server.js";

export default async (req, res) => {
  const app = await appPromise;
  return app(req, res);
};
