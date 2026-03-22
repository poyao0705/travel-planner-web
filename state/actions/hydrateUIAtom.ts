// TODO: future implementation - when backend pass in the whole UI state, we can use this atom to update the UI state in one go, instead of having to update each atom separately. This can be useful when we have a lot of UI state and we want to avoid multiple re-renders. We can also use this atom to initialize the UI state when the app loads, by passing in the initial UI state from the backend.

// export const hydrateUIAtom = atom(
//   null,
//   (_, set, backendState: Partial<Record<keyof typeof uiRegistry, UIBlock>>) => {
//     for (const key in backendState) {
//       const atom = uiRegistry[key];
//       const value = backendState[key];

//       if (atom && value !== undefined) {
//         set(atom, value);
//       }
//     }
//   }
// );
