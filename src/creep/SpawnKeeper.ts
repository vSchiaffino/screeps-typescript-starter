import ResourceWorker from "./ResourceWorker";

export default class SpawnKeeper extends ResourceWorker {
  protected work(): void {
    const structuresNeedingEnergy = this.getStructuresNeedingEnergy();
    if (structuresNeedingEnergy.length === 0) {
      this.creep.say("idle");
      return;
    }
    const nearestStructure = this.getNearestStructure(structuresNeedingEnergy);
    if (!nearestStructure) throw new Error();
    if (this.creep.transfer(nearestStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(nearestStructure, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}
