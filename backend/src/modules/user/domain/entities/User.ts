export class User {
  constructor(
    public id: string,
    public name: string,
    public mobile: string,
    public role: 'admin' | 'client',
    public isActive: boolean,
    public email?: string | null,
    public lastLogin?: Date | null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public password?: string
  ) { }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public isClient(): boolean {
    return this.role === 'client';
  }
}
