"use client";

export default function Page() {
  return (
    <div>
      <div className="px-1 py-2 text-xl w-full text-center">About the app</div>
      <div>
        <div className="px-1 py-2">
          This web site is used to show some patterns in front-end web
          development. Such as Routing, Responsiveness and component structure
        </div>
        <div className="px-1 py-2">
          The use of Mock service worker (MSW) in the client enables the
          developer to run the client without the back-end server and still get
          relevant and quick responses, this can really speed up the dev time if
          for instance the back-end service is still under development. This is
          also a used for data mocking in the testing suite.
        </div>
        <div className="px-1 py-3 text-lg">The site uses:</div>
        <ul className="list-disc pl-6">
          <li>
            <strong>Next.js:</strong> As front-end framework
          </li>
          <li>
            <strong>App-Router:</strong> For SPA-routing
          </li>
          <li>
            <strong>Tailwind:</strong> As component and styling framework
          </li>
          <li>
            <strong>Fetch:</strong> For accessing the backend API
          </li>
          <li>
            <strong>MSW:</strong> Used for mocking the backend to be able to run
            only the client, but also used for mocking in the automatic tests
          </li>
          <li>
            <strong>Typescript:</strong> For enabling type checking, safety and
            intellisense when developing
          </li>
          <li>
            <strong>Turbo-pack:</strong> As dev host
          </li>
          <li>
            <strong>Vitest:</strong> As dev testrunner
          </li>
          <li>
            <strong>React-testing-library:</strong> As testing framework
          </li>
        </ul>
      </div>
    </div>
  );
}
