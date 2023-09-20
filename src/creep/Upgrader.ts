import MyCreep from "./MyCreep";

export default class Upgrader extends MyCreep {
  public loop(): void {
    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isUpgrading = this.creep.memory.upgrading;

    if (isUpgrading && isStoreEmpty) this.startHarvesting();
    if (!isUpgrading && isStoreFull) this.startUpgrading();

    if (this.creep.memory.upgrading) {
      this.upgrade();
    } else {
      this.harvest();
    }
  }

  private startUpgrading() {
    this.creep.memory.upgrading = true;
    this.creep.say("⚡ upgrade");
  }

  private startHarvesting() {
    this.creep.memory.upgrading = false;
    this.creep.say("🔄 harvest");
  }
}
