import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm"
import { Usuarios } from "./Usuarios"
import { Templates } from "./Templates"
import { Categorias } from "./Categorias"

@Entity("uploads")
export class Uploads {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 50 })
    nome: string

    @Column("varchar", { length: 100 })
    descricao: string

    @Column("timestamp")
    dataUpload: Date

    @Column("varchar", { length: 500 })
    caminho: string

    @Column("varchar", { length: 20 })
    criadopor: string

    //aprovado / pendente / negado
    @Column("varchar", { length: 20 })
    status: string

    @Column("int")
    usuarioId?: number

    @Column("int")
    templateId?: number

    @Column("int")
    categoriaId?: number
    
    @ManyToOne(() => Usuarios)
    @JoinColumn({ name: 'usuarioId' }) // Nome da coluna de chave estrangeira para template
    usuario: Usuarios;

    @ManyToOne(() => Templates)
    @JoinColumn({ name: 'templateId' }) 
    template: Templates;

    @ManyToOne(() => Categorias)
    @JoinColumn({ name: 'categoriaId' }) 
    categoria: Categorias;
}