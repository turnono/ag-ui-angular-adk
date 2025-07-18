# @ag-ui/angular-adk

Angular components and services for integrating ADK agents with the AG-UI protocol.

## Features

* **AGUIEvent** – typed union describing the different kinds of events that can be emitted by an AG‑UI agent.
* **AgentUiAdkService** – opens a POST `run_sse` connection, converts incoming ADK events into `AGUIEvent` objects and automatically reconnects when the stream closes. A `disconnect()` method can be used to close the connection manually.
* **AgentUiRendererComponent** – standalone component that renders an `Observable<AGUIEvent>` stream for quick prototyping.
* **FirebaseSessionService** – helper for persisting sessions in Firebase; automatically performs anonymous sign‑in and exposes a `BehaviorSubject` representing the current session state.

The sources are organised under `components/` and `services/` directories to make it easy to tree‑shake unused functionality.
