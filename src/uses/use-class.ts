import { getDependencies, getDependencyCount } from '../reflection'
import {
  Abstract,
  Buildable,
  BuildOptions,
  Identifier,
  Newable,
  RegistrationType,
  ServiceData,
} from '../types'
import { Use } from './use'

export class UseClass<T> extends Use<T> {
  private dependencies: Array<Identifier<unknown>> = []
  private autowire = true

  private constructor(private readonly newable: Newable<T>) {
    super()
  }

  public withDependencies(dependencies: Array<Abstract<unknown>>): UseClass<T> {
    this.dependencies = dependencies
    this.autowire = false
    return this
  }

  private setDependencyInformationIfNotExist(
    identifier: Newable<T>,
    options: BuildOptions
  ): void {
    const autowire = options.autowire && this.autowire
    if (
      !autowire &&
      getDependencyCount(this.newable) > this.dependencies.length
    ) {
      throw new Error(
        `Dependencies must be provided for non autowired services. Service with missing dependencies: ${identifier.name}`
      )
    }

    if (autowire) {
      this.dependencies = getDependencies(this.newable)
    }
  }

  protected build(options: BuildOptions): ServiceData<T> {
    this.setDependencyInformationIfNotExist(this.newable, options)

    return {
      type: RegistrationType.Class,
      class: this.newable,
      dependencies: this.dependencies,
      autowire: this.autowire,
    }
  }

  public static createBuildable<TIdentifier>(
    newable: Newable<TIdentifier>
  ): Buildable<UseClass<TIdentifier>, TIdentifier> {
    const use = new UseClass(newable)
    return {
      instance: use,
      build: (options: BuildOptions): ServiceData<TIdentifier> =>
        use.build(options),
    }
  }
}