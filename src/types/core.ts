import { MachineConfig } from "xstate";

export type Event =
  | { type: "ENTITY_DEFEATED" }
  | { type: "ENTITY_STALEMATE" }
  | { type: "ENTITY_KILLED" };

export type Context = { currentPlayer?: number };

const initialContext: Context = { currentPlayer: undefined };

export interface Schema {
  states: {
    TURN_START: {};
    TURN_SKIP: {};
    TURN_END: {};

    // Other players whose waiting their turn.
    IDLE: {};
    // Active Player
    TURN: {};

    // Use item/follower/special and/or dice to move ( can't use some spells like teleport ) -> moving
    MOVE: {};

    // Choose tile after accepting result, using entity to move or casting spell
    // This contains the visual act of moving
    MOVING: {};

    // Can loop: throw -> result -> use follower/item/special to change result -> [throw->] result ...
    // Other users can interract during this phase ( change dice throw for instance )
    DICE_RESULT: {};

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
  | { type: "THROW_DICE" }
  | { type: "ACCEPT_DICE" }
  | { type: "CHOOSE_MOVE" };

// start turn, choose move, throw dice, accept dice result

const xStateConfig: MachineConfig<Context, Schema, Event> = {
  id: "Talisman Engine",
  initial: "TURN_START",
  context: initialContext,
  states: {
    TURN_START: { on: { CHOOSE_MOVE: "MOVE" } },
    DICE_RESULT: { on: { ACCEPT_DICE: "MOVE" } },
  },
  MOVE: {
    invoke: {
      id: "MOVE",
      src: (_context: Context, _event: any) => "move",
      onDone: { action: "movePlayer", target: "ENCOUNTER" },
    },
  },
};
