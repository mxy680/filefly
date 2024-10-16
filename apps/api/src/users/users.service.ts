import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/db.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }
}