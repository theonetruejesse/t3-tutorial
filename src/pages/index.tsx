import { type NextPage } from "next";
import Head from "next/head";

import { api } from "../utils/api";
import type { RouterOutputs } from "../utils/api";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { UnwrapPromise } from "@prisma/client/runtime/library";
import { useState, useEffect } from "react";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const user = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-4">
      <UserButton showName={true} afterSignOutUrl="/" />
      <input
        className="grow bg-transparent outline-none"
        placeholder="Text here!"
      />
      <button className="rounded-md bg-purple-500 p-2 text-black">
        Submit
      </button>
    </div>
  );
};

type PostWithUser = UnwrapPromise<RouterOutputs["posts"]["getAll"][number]>;
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div
      className="flex gap-2 border-y border-slate-500 px-4 py-8"
      key={post.id}
    >
      <Image
        className="h-12 w-12 rounded-full"
        src={author.imageUrl}
        alt={`${author.username} profile picture`}
        height={48}
        width={48}
        // probably implemented wrong, but yolo
        placeholder="blur"
        blurDataURL={author.blurredUrl}
      />
      <div className="flex flex-col self-center">
        <div className="flex gap-2 text-sm text-slate-300">
          <span className="font-medium">{`@${author.username}`}</span>
          <span>|</span>
          <span className="font-extralight">{`${dayjs(
            post.createdAt,
          ).fromNow()}`}</span>
        </div>
        <span className="text-lg text-white">{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Something went wrong.</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="container border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn && (
              <div className="ml-auto pr-5 text-white">
                <SignInButton />
              </div>
            )}
            {!!user.isSignedIn && <CreatePostWizard />}
          </div>

          <div className="flex flex-col">
            {data.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
