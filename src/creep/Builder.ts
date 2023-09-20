import MyCreep from "./MyCreep";

export default class Builder extends MyCreep {
  public loop(): void {
    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isBuilding = this.creep.memory.building;

    if (isBuilding && isStoreEmpty) this.startHarvesting();
    if (!isBuilding && isStoreFull) this.startBuilding();

    if (this.creep.memory.building) {
      this.build();
    } else {
      this.harvest();
    }
  }

  private startBuilding() {
    this.creep.memory.building = true;
    this.creep.say("🚧 build");
  }

  private startHarvesting() {
    this.creep.memory.building = false;
    this.creep.say("🔄 harvest");
  }
}
