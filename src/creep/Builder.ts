import ResourceWorker from "./ResourceWorker";

export default class Builder extends ResourceWorker {
  protected work(): void {
    this.build();
  }
}
