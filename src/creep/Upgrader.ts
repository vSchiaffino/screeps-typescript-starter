import MyCreep from "./MyCreep";

export default class Upgrader extends MyCreep {
  public loop(): void {
    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isUpgrading = this.creep.memory.upgrading;

    if (isUpgrading && isStoreEmpty) this.startEnergyLookup();
    if (!isUpgrading && isStoreFull) this.startUpgrading();

    if (this.creep.memory.upgrading) {
      this.upgrade();
    } else {
      this.lookForEnergy();
    }
  }

  private startUpgrading() {
    this.creep.memory.upgrading = true;
    this.creep.say("⚡ upgrade");
  }

  private startEnergyLookup() {
    this.creep.memory.upgrading = false;
    this.creep.say("🔄 energy");
  }
}
