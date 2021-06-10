import { Machine, MachineConfig, MachineOptions, interpret } from "xstate";
import { inspect } from "@xstate/inspect";
import "./styles.css";

inspect({
  url: "https://statecharts.io/inspect",
  iframe: false,
});

export type Context = { currentPlayer?: number };

const initialContext: Context = { currentPlayer: undefined };

export interface Schema {
  states: {
    TURN_START: {};
    TURN_SKIP: {};
    TURN_END: {};

    IDLE: {};
    TURN: {};

    MOVE: {};
    MOVING: {};

    DICE: {};
    DICE_RESULT: {};

    USE_ITEM: {};
    USE_FOLLOWER: {};
    USE_SPELL: {};
    USE_ABILITY: {};

    //USE_ENTITY: { id: number; type: string };
    USE_ENTITY: {};

    ENCOUNTER: {};

    ENTITY_ENCOUNTER: {};
    ENTITY_KILLED: {};
    ENTITY_STALEMATE: {};
    ENTITY_DEFEATED: {};

    AVOIDING_BATTLE: {};
    STARTING_BATTLE: {};
    ENDING_BATTLE: {};
  };
}

export type Transitions =
  | { type: "START_BATTLE" }
  | { type: "AVOID_BATTLE" }
  | { type: "END_BATTLE" }
  | { type: "CHOOSE_DICE" }
  | { type: "THROW_DICE" }
  | { type: "ACCEPT_DICE" }
  | { type: "CHOOSE_ITEM" }
  | { type: "CHOOSE_FOLLOWER" }
  | { type: "CHOOSE_SPELL" }
  | { type: "CHOOSE_ABILITY" }
  | { type: "CHOOSE_MOVE" };

export type Events =
  | { type: "ENTITY_DEFEATED" }
  | { type: "ENTITY_STALEMATE" }
  | { type: "ENTITY_KILLED" };

const xStateConfig: MachineConfig<Context, Schema, Transitions | Events> = {
  id: "Talisman Engine",
  initial: "TURN_START",
  context: initialContext,
  states: {
    // start turn -> throw dice -> accept dice result -> move
    // (throw dice implies you want to 'MOVE')
    TURN_START: { on: { CHOOSE_DICE: { target: "DICE_THROW" } } },
    TURN_SKIP: {},
    TURN_END: {},

    // Other players whose waiting their turn.
    IDLE: {},
    // Active Player
    TURN: {},

    // Use item/follower/special and/or dice to move ( can't use some spells like teleport ) -> moving
    //MOVE: { on: { CHOOSE_DICE: { target: "DICE" } } },

    MOVE: {},

    // Choose tile after accepting result, using entity to move or casting spell
    // This also contains the visual act of moving
    MOVING: {},

    // Can loop: throw -> result -> use follower/item/special to change result -> [throw->] result ...
    DICE: {
      on: {
        CHOOSE_DICE: { target: "DICE_THROW" },
        // TODO: Maybe concat to: CHOOSE_ENTITY { id: [entityId], type: "item"/"follower"/.., ...}
        CHOOSE_ITEM: { target: "USE_ITEM" },
        CHOOSE_FOLLOWER: { target: "USE_FOLLOWER" },
        CHOOSE_SPELL: { target: "USE_SPELL" },
        CHOOSE_ABILITY: { target: "USE_ABILITY" },

        //CHOOSE_ENTITY: { target: "USE_ENTITY" },
      },
    },
    // Other users can interract during this phase ( change dice throw for instance )
    DICE_RESULT: {},

    USE_ITEM: {},
    USE_FOLLOWER: {},
    USE_SPELL: {},
    USE_ABILITY: {},

    USE_ENTITY: {},

    ENCOUNTER: {},

    ENTITY_ENCOUNTER: {},
    ENTITY_KILLED: {},
    ENTITY_STALEMATE: {},
    ENTITY_DEFEATED: {},

    AVOIDING_BATTLE: {},
    STARTING_BATTLE: {},
    ENDING_BATTLE: {},
  },
  /*
  MOVE: {
    invoke: {
      id: "MOVE",
      src: (_context: Context, _event: any) => "move",
      onDone: { action: "movePlayer", target: "ENCOUNTER" },
    },
  },
  */
};

// Toggle the commented and uncommented lines in each function to change the outcome of the machine!
const xStateOptions: Partial<MachineOptions<Context, any>> = {
  services: {
    fetchEmails: async () => {
      return new Promise<void>((resolve, _reject) => {
        resolve();
        // reject();
      });
    },
  },
  /*
  actions: {
    setEmails: assign({ emails: (context, event) => event.data }),
  },
  guards: {
    isDraftingEmail: () => {
      return true;
      // return false;
    },
  },
  */
};

const xStateMachine = Machine<Context, Schema, Transitions | Events>(
  xStateConfig,
  xStateOptions
);

// Edit your service(s) here
const service = interpret(xStateMachine, { devTools: true }).onTransition(
  (state) => {
    console.log(state.value);
  }
);

service.start();
