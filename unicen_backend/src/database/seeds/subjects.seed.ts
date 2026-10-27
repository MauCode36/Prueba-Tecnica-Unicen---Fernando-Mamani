import { DataSource } from "typeorm";
import { SubjectEntity } from "../../modules/subjects/subject.entity";

const BASE_SUBJECTS: ReadonlyArray<{
  code: string;
  name: string;
  credits: number;
}> = [
  { code: "MAT-101", name: "Cálculo I", credits: 5 },
  { code: "FIS-101", name: "Física I", credits: 5 },
  { code: "PRG-101", name: "Programación I", credits: 4 },
  { code: "BDD-201", name: "Base de Datos I", credits: 4 },
  { code: "SIS-301", name: "Ingeniería de Software", credits: 4 },
];

/**
 * Inserts the base subjects, skipping existing codes (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedSubjects(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(SubjectEntity);
  for (const data of BASE_SUBJECTS) {
    if (await repository.existsBy({ code: data.code })) continue;
    await repository.save(repository.create(data));
  }
}
