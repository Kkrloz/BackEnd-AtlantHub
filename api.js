import { supabase } from "./supabaseClient";

// ========== AUTENTICAÇÃO ==========
export const authAPI = {
  // Cadastrar usuário
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      // Criar perfil do usuário
      await supabase
        .from("profiles")
        .insert([{ id: data.user.id, full_name: fullName }]);
    }

    return { data, error };
  },

  // Login
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // Logout
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Verificar sessão
  async getSession() {
    return await supabase.auth.getSession();
  },

  // Recuperar senha
  async resetPassword(email) {
    return await supabase.auth.resetPasswordForEmail(email);
  },
};

// ========== PRODUTOS ==========
export const productsAPI = {
  // Buscar todos os produtos
  async getProducts(filters = {}) {
    let query = supabase.from("products").select("*").eq("active", true);

    // Aplicar filtros
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    // Ordenação
    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === "asc",
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Paginação
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Buscar produto por ID
  async getProduct(id) {
    const { data, error } = await supabase
      .from("products")
      .select("*, reviews(*)")
      .eq("id", id)
      .single();

    return { data, error };
  },

  // Buscar produtos por categoria
  async getProductsByCategory(category, limit = 10) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .eq("active", true)
      .limit(limit);

    return { data, error };
  },
};

// ========== CARRINHO ==========
export const cartAPI = {
  // Adicionar ao carrinho
  async addToCart(productId, quantity = 1) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: productId,
        quantity,
      },
      {
        onConflict: "user_id,product_id",
      }
    );

    return { data, error };
  },

  // Remover do carrinho
  async removeFromCart(productId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    return { error };
  },

  // Atualizar quantidade
  async updateCartItem(productId, quantity) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    return { error };
  },

  // Buscar carrinho do usuário
  async getCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: [], error: null };

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products:product_id (*)
      `
      )
      .eq("user_id", user.id);

    return { data, error };
  },

  // Limpar carrinho
  async clearCart() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    return { error };
  },
};

// ========== PEDIDOS ==========
export const ordersAPI = {
  // Criar pedido
  async createOrder(orderData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const order = {
      user_id: user.id,
      status: "pending",
      total: orderData.total,
      items: orderData.items,
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod,
      payment_status: "pending",
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select()
      .single();

    if (!error) {
      // Limpar carrinho após criar pedido
      await cartAPI.clearCart();
    }

    return { data, error };
  },

  // Buscar pedidos do usuário
  async getUserOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: [], error: null };

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Buscar pedido específico
  async getOrder(orderId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    return { data, error };
  },
};

// ========== PERFIL ==========
export const profileAPI = {
  // Buscar perfil
  async getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: null };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { data, error };
  },

  // Atualizar perfil
  async updateProfile(profileData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id)
      .select()
      .single();

    return { data, error };
  },
};

// ========== AVALIAÇÕES ==========
export const reviewsAPI = {
  // Criar avaliação
  async createReview(productId, rating, comment) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          rating,
          comment,
        },
      ])
      .select();

    return { data, error };
  },

  // Buscar avaliações do produto
  async getProductReviews(productId) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (full_name)
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    return { data, error };
  },
};
