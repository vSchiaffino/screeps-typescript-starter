import MyCreep from "./MyCreep";

export default class Harvester extends MyCreep {
  public loop(): void {
    const canStoreMoreEnergy = this.creep.store.getFreeCapacity() > 0;
    if (canStoreMoreEnergy) {
      this.harvest();
    } else {
      this.storeEnergyInStructure();
    }
  }
}
