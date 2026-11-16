import { inject } from '@angular/core';
import { CanActivateChildFn } from '@angular/router';
import { SpaceService } from '../services/space.service';

/**
 * Antes de activar la nueva vista, anima la salida de la actual (salto de hiperespacio).
 * Angular espera a que la promesa se resuelva, así que la vista vieja se ve hasta el final del efecto.
 */
export const transitionGuard: CanActivateChildFn = async () => {
  await inject(SpaceService).leave();
  return true;
};
