import express from "express";
import bcrypt from "bcrypt";
import { ZodError, ZodIssue } from "zod";
import { ObjectId } from "mongodb";
import { omit } from "lodash";

import { User, Users } from "./users.models";
import { cloneObj } from "../../utils/cloneObj";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await Users.find({}).toArray();
    const usersWithoutPassword = users.map((user) => omit(user, ["password"]));
    if (users) return res.status(200).json({ users: usersWithoutPassword });
    else throw new Error("There's something wrong");
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const parsedBody = User.parse({
      ...cloneObj(req.body),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const user = await Users.findOne({ email: parsedBody.email });
    if (user) throw new Error("User already exists!");

    const hashedPassword = await bcrypt.hash(parsedBody.password, 10);

    const result = await Users.insertOne({
      ...parsedBody,
      password: hashedPassword,
    });

    if (result)
      return res
        .status(200)
        .json({ message: `User with id: ${result.insertedId} created` });
    else throw new Error("There's something wrong!");
  } catch (error) {
    if (error instanceof ZodError) {
      const consolidatedMessages = error.issues.map(
        (issue: ZodIssue) => issue.message,
      );
      return res.status(400).json({ error: consolidatedMessages });
    }
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
    //TODO:Build error for existing user
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsedBody = User.parse(req.body);
    const user = await Users.findOne({ email: parsedBody.email });
    if (!user) throw new Error("User does not exist!");

    const isPasswordMatch = bcrypt.compare(parsedBody.password, user.password);
    if (!isPasswordMatch) throw new Error("Invalid credentials");

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });
  } catch (error) {
    if (error instanceof ZodError) {
      const consolidatedMessages = error.issues.map(
        (issue: ZodIssue) => issue.message,
      );
      return res.status(400).json({ error: consolidatedMessages });
    }
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id) throw new Error("Should pass in an ID params");

    const parsedBody = User.partial().parse({
      ...cloneObj(req.body),
      updatedAt: new Date().toISOString(),
    });
    const result = await Users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: parsedBody },
      { returnDocument: "after" },
    );
    if (result)
      return res.status(200).json({ data: omit(result, ["password"]) });
    else throw new Error("There's something wrong!");
  } catch (error) {
    if (error instanceof ZodError) {
      const consolidatedMessages = error.issues.map(
        (issue: ZodIssue) => issue.message,
      );
      return res.status(400).json({ error: consolidatedMessages });
    }
    if (error instanceof Error)
      return res.status(500).json({ message: (error as Error).message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id) throw new Error("Should pass in an ID params");
    const result = await Users.deleteOne({ _id: new ObjectId(id) });
    if (result)
      return res.status(200).json({ message: `User with id: ${id} deleted` });
    else throw new Error("failed");
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
