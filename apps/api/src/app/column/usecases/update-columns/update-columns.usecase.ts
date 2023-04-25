import { Injectable } from '@nestjs/common';
import { FileMimeTypesEnum } from '@impler/shared';
import { ColumnRepository, TemplateRepository } from '@impler/dal';
import { ColumnCommand } from '../../commands/column.command';
import { StorageService } from '@impler/shared/dist/services/storage';
import { FileNameService } from '@shared/file/name.service';

@Injectable()
export class UpdateColumns {
  constructor(
    private columnRepository: ColumnRepository,
    private storageService: StorageService,
    private fileNameService: FileNameService,
    private templateRepository: TemplateRepository
  ) {}

  async execute(command: ColumnCommand[], _templateId: string) {
    await this.columnRepository.deleteMany({ _templateId });
    this.saveSampleFile(command, _templateId);

    return this.columnRepository.createMany(command);
  }

  async saveSampleFile(data: ColumnCommand[], templateId: string) {
    const csvContent = this.createCSVFileHeadingContent(data);
    const fileName = this.fileNameService.getSampleFileName(templateId);
    const sampleFileUrl = this.fileNameService.getSampleFileUrl(templateId);
    await this.storageService.uploadFile(fileName, csvContent, FileMimeTypesEnum.CSV);
    await this.templateRepository.update({ _id: templateId }, { sampleFileUrl });
  }

  createCSVFileHeadingContent(data: ColumnCommand[]): string {
    const headings = data.map((column) => column.key);

    return headings.join(',');
  }
}
