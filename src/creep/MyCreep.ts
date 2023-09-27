type Container = StructureContainer | StructureStorage;

export default class MyCreep {
  protected creep;
  constructor(creep: Creep) {
    this.creep = creep;
  }
  public loop() {}

  protected getNearestStructureNeedingEnergy() {
    const notTower = this.creep.pos.findClosestByPath<AnyStoreStructure>(FIND_MY_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    if (notTower) return notTower;

    return this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
  }

  protected getNearestStructureNeedingRepair() {
    return this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return structure.hits < structure.hitsMax;
      }
    });
  }

  protected storeEnergyInStructure() {
    this.creep.memory.harvestingIn = undefined;
    let structure = this.getNearestStructureNeedingEnergy();
    if (structure) {
      if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(structure, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }

  protected upgrade() {
    const creep = this.creep;
    if (creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  protected lookForEnergy() {
    const container = this.getNearestContainer();
    // if (this.creep.memory.dndTimer !== undefined) {
    //   this.creep.say("dnd" + this.creep.memory.dndTimer);
    //   this.creep.moveTo(Game.flags["dnd"], { visualizePathStyle: { stroke: "#ffffff" } });
    //   this.creep.memory.dndTimer -= 1;
    //   if (this.creep.memory.dndTimer <= 0) {
    //     this.creep.memory.dndTimer = undefined;
    //   }
    //   return;
    // }

    if (container) {
      this.lookForEnergyInContainer(container);
    } else {
      this.harvest();
      // console.log("not container found");
      // this.creep.say("dnd");
      // this.creep.memory.dndTimer = 50;
    }
  }

  protected lookForEnergyInContainer(container: Container) {
    const result = this.creep.withdraw(container, RESOURCE_ENERGY);
    if (result === ERR_NOT_IN_RANGE) {
      this.creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  protected getNearestContainer(): Container | null {
    return this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        const isStorage = structure.structureType == STRUCTURE_STORAGE;
        const isContainer = structure.structureType === STRUCTURE_CONTAINER;
        return (isStorage || isContainer) && structure.store.energy > this.creep.store.getCapacity();
      }
    });
  }

  protected harvest() {
    const source = this.getSourceToHarvest();
    if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }

  protected getSourceToHarvest(): Source {
    const harvestingId = this.creep.memory.harvestingIn;
    const isAlreadyHarvesting = harvestingId !== undefined;
    return isAlreadyHarvesting
      ? this.creep.room.find(FIND_SOURCES, { filter: source => source.id === harvestingId })[0]
      : this.decideNextHarvestSource();
  }

  protected decideNextHarvestSource(): Source {
    const sources = this.creep.room.find(FIND_SOURCES);
    const creeps = Object.values(Game.creeps);
    const harvesterCountBySourceId: { [sourceId: string]: number } = {};
    for (const source of sources) {
      harvesterCountBySourceId[source.id] = 0;
    }
    for (const creep of creeps) {
      if (creep.memory.harvestingIn !== undefined) harvesterCountBySourceId[creep.memory.harvestingIn] += 1;
    }
    let bestQ = 1000;
    let bestSourceId = "";
    for (const [sourceId, q] of Object.entries(harvesterCountBySourceId)) {
      if (q < bestQ) {
        bestQ = q;
        bestSourceId = sourceId;
      }
    }
    const nextSource = sources.find(s => s.id === bestSourceId);
    if (!nextSource) throw new Error("source not found");

    this.creep.memory.harvestingIn = nextSource.id;

    return nextSource;
  }

  protected build() {
    const targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);

    if (targets.length) {
      const constWithMinWorkLeft = _.min(targets, target => target.progressTotal - target.progress);
      if (this.creep.build(constWithMinWorkLeft) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(constWithMinWorkLeft, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else {
      // this.
      this.upgrade();
      // this.creep.say("idle builder");
    }
  }
}
