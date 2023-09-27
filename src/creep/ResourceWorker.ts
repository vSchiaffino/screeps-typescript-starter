import MyCreep from "./MyCreep";

export default abstract class ResourceWorker extends MyCreep {
  public loop(): void {
    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isWorking = this.creep.memory.isWorking;

    if (isWorking && isStoreEmpty) this.startEnergyLookup();
    if (!isWorking && isStoreFull) this.startWorking();

    if (this.creep.memory.isWorking) {
      this.work();
    } else {
      this.lookForEnergy();
    }
  }

  protected work() {}

  private startWorking() {
    this.creep.memory.isWorking = true;
  }

  private startEnergyLookup() {
    this.creep.memory.isWorking = false;
    this.creep.say("🔄 energy");
  }

  protected decideNextHarvestSource(): Source {
    const pos = this.creep.pos;
    return pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;
  }
}
