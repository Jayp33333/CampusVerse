import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") color: string = "#ffffff";

  // Position
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  // Facing direction (radians around the Y axis)
  @type("number") rotation: number = 0;

  @type("boolean") moving: boolean = false;

  @type("string") emote: string = "";
  @type("number") emoteSeq: number = 0;
}

export class IskaState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
