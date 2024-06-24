import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Newsletter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

import { ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

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
  const actionData = useActionData();
  const transition = useNavigation();
  const state: "idle" | "success" | "error" | "submitting" =
    transition.submission
      ? "submitting"
      : actionData?.subscription
      ? "success"
      : actionData?.error
      ? "error"
      : "idle";

  return (
    <main>
      <Form method="post" aria-hidden={state === "success"}>
        <div>
          <h2>Subscribe!</h2>
          <p>Dont miss any of the action</p>
          <fieldset>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="rounded-lg p-2 m-2"
            />
            <button type="submit">Subscribe</button>
          </fieldset>

          <p>
            {(actionData as { error?: string })?.error ? (
              (actionData as { message?: string })?.message
            ) : (
              <>&nbsp;</>
            )}
          </p>
        </div>
      </Form>

      <div aria-hidden={state !== "success"}>
        <h2>You are now subscribed to the newsletter!</h2>
        <p>Please check your email to confirm your subscribtion</p>
        <Link to=".">Start over</Link>
      </div>
    </main>
  );
}
