import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

//representa a tabela usuarios no banco de dados
@Entity("permissoes")
export class Permissoes {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 45 })
    nome: string
}