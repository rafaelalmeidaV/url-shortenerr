import {Controller, Get} from '@nestjs/common';

@Controller()
export class LivenessReadinessController {
  @Get('health')
  public amIAlive(): string {
    return 'Vivo!';
  }
}
