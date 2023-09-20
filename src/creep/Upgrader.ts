import ResourceWorker from "./ResourceWorker";

export default class Upgrader extends ResourceWorker {
  protected work(): void {
    this.upgrade();
  }
}
