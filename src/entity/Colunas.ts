import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import { usuarioPermissoes } from "./UsuariosPermissoes"
import { Templates } from "./Templates"

//representa a tabela usuarios no banco de dados
@Entity("colunas")
export class Colunas {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id?: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 45 })
    nome: string

    @Column("varchar", { length: 45 })
    tipo: string

    @Column("bool")
    nulo: boolean

    @Column("int")
    templateId?: number

    @ManyToOne(() => Templates)
    @JoinColumn({ name: 'templateId' }) // Nome da coluna de chave estrangeira para template
    template: Templates;
}


