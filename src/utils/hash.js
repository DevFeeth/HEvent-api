import argon2 from "argon2";

const pepper = () => Buffer.from(process.env.PEPPER);

export const hash = (password) => argon2.hash(password, {secret: pepper()});

export const verify = (hashed, password) => argon2.verify(hashed, password, {secret: pepper()});