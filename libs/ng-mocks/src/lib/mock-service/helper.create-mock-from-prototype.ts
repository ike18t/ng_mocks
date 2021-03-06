import helperMockService from './helper.mock-service';
import { MockedFunction } from './types';

export default (service: any): { [key in keyof any]: MockedFunction } => {
  const mockName = `${service && service.constructor ? service.constructor.name : 'unknown'}`;
  const value: any = {};

  const methods = helperMockService.extractMethodsFromPrototype(service);
  for (const method of methods) {
    helperMockService.mock(value, method, mockName);
  }

  const properties = helperMockService.extractPropertiesFromPrototype(service);
  for (const property of properties) {
    helperMockService.mock(value, property, 'get', mockName);
    helperMockService.mock(value, property, 'set', mockName);
  }

  if (typeof value === 'object' && typeof service === 'object') {
    Object.setPrototypeOf(value, service);
  }

  return value;
};
