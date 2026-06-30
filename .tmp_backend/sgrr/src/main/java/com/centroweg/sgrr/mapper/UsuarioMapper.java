package com.centroweg.sgrr.mapper;

import com.centroweg.sgrr.dto.UsuarioRequestDTO;
import com.centroweg.sgrr.dto.UsuarioResponseDTO;
import com.centroweg.sgrr.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(dto.senha());
        usuario.setPerfil(dto.perfil());
        return usuario;
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil()
        );
    }

}
