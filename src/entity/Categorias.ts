import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import { usuarioPermissoes } from "./UsuariosPermissoes"
import { Templates } from "./Templates"

//representa a tabela usuarios no banco de dados
@Entity("categorias")
export class Categorias {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id?: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 45 })
    nome: string
}


