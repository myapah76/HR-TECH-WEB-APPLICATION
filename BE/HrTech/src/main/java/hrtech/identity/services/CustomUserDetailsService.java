package hrtech.identity.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import hrtech.identity.abstractions.repositories.UserRepository;
import hrtech.identity.entities.User;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,"User not found with username: " + username));
        return new CustomUserDetails(user);
    }
}
