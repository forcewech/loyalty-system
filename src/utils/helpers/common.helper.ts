export class CommonHelper {
  static generateOTP(): string {
    return Math.floor(Math.random() * 9000 + 1000) + '';
  }
}
