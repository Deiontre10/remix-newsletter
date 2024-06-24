import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Newsletter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

import { ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  const API_KEY = process.env.CONVERTKIT_KEY;
  const FORM_ID = "6746889";
  const API = "https://api.convertkit.com/v3/forms/";

  const res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
    method: "post",
    body: JSON.stringify({ email, api_key: API_KEY }),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  return res.json();
};

export default function Newsletter() {
  const actionData = useActionData() as {
    subscription?: unknown;
    error?: unknown;
    message?: string;
  };
  const transition = useNavigation() as { submission?: { state: string } };
  const state: "idle" | "success" | "error" | "submitting" =
    transition.submission?.state ?? "idle"
      ? "submitting"
      : actionData?.subscription
      ? "success"
      : actionData?.error
      ? "error"
      : "idle";

  const inputRef = useRef<HTMLInputElement>(null);
  const successref = useRef<HTMLHeadingElement>(null);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (state === "error") {
      inputRef.current?.focus();
    }

    if (state === "idle" && mounted.current) {
      inputRef.current?.select();
    }

    if (state === "success" && mounted.current) {
      inputRef.current?.focus();
    }

    mounted.current = true;
  }, [state]);

  return (
    <main>
      <Form replace method="post" aria-hidden={state === "success"}>
        <div>
          <h2>Subscribe!</h2>
          <p>Dont miss any of the action</p>
          <fieldset disabled={state === "submitting"}>
            <input
              aria-label="Email address"
              aria-describedby="error-message"
              ref={inputRef}
              type="email"
              name="email"
              placeholder="you@example.com"
            />
            <button type="submit">
              {state === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
          </fieldset>

          <p id="error-message">
            {state === "error" ? actionData?.message : <>&nbsp;</>}
          </p>
        </div>
      </Form>

      <div aria-hidden={state !== "success"}>
        <h2 ref={successref} tabIndex={-1}>
          You are now subscribed to the newsletter!
        </h2>
        <p>Please check your email to confirm your subscribtion</p>
        <Link to=".">Start over</Link>
      </div>
    </main>
  );
}
