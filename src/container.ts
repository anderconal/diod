import { ServiceData } from './internal-types'
import { RegistrationType } from './registration-type'
import { Identifier } from './types'

/**
 * Creates, wires dependencies and manages lifetime for a set of services.
 * Most instances of Container are created by a [[ContainerBuilder]].
 */
export class Container {
  /**
   * @internal
   */
  public constructor(
    private readonly services: ReadonlyMap<
      Identifier<unknown>,
      ServiceData<unknown>
    >
  ) {}

  /**
   * Gets the service object of the registered identifier.
   * @param identifier Class of the service to get.
   * @typeParam T The type of the service.
   * @returns
   */
  public get<T>(identifier: Identifier<T>): T {
    const data = this.findServiceDataOrThrow(identifier)
    const dependencies = this.getDependencies(data.dependencies)

    if (data.type === RegistrationType.Class) {
      return new data.class(...dependencies)
    }

    if (data.type === RegistrationType.Instance) {
      return data.instance
    }

    return data.factory()
  }

  private findServiceDataOrThrow<T>(identifier: Identifier<T>): ServiceData<T> {
    const service = this.services.get(identifier)

    if (!service) {
      throw new Error(`Service not registered for: ${identifier.name}`)
    }

    return service as ServiceData<T>
  }

  private getDependencies(
    dependencyIdentifiers: Array<Identifier<unknown>>
  ): unknown[] {
    const dependencies = new Array<unknown>()
    for (const dependencyIdentifier of dependencyIdentifiers) {
      dependencies.push(this.get(dependencyIdentifier))
    }

    return dependencies
  }
}
