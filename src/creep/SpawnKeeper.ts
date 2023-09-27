import ResourceWorker from "./ResourceWorker";

export default class SpawnKeeper extends ResourceWorker {
  protected work(): void {
    const structure = this.getNearestStructureNeedingEnergy();
    if (!structure) {
      this.creep.say("idle");
      return;
    }
    if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(structure, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}
