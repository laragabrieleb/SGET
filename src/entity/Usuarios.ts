import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany, JoinColumn } from "typeorm"
import { usuarioPermissoes } from "./UsuariosPermissoes"

//representa a tabela usuarios no banco de dados
@Entity("usuarios")
export class Usuarios {
    //coluna como uma chave primária autoincrementável
    @PrimaryGeneratedColumn()
    id: number 

    //as colunas devem ser mapeadas iguais ao banco de dados 
    @Column("varchar", { length: 45 })
    nome: string

    @Column("varchar", { length: 45 })
    matricula: string

    @Column("varchar", { length: 300 })
    senha: string

    @Column("timestamp")
    datacriacao: Date

    @Column("bool")
    situacao: boolean

    @Column("varchar", { length: 20 })
    criadopor: string

    @OneToMany(() => usuarioPermissoes, (usuarioPermissao) => usuarioPermissao.usuario)
    usuarioPermissoes: usuarioPermissoes[];
}

export function senhaEhValida(senha: string): boolean {
    if (senha.length < 8) {
        return false;
    } else {
        return true;
    }
}

